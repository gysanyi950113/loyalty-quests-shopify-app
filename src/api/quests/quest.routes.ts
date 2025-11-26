import { Router, Request, Response } from 'express';
import { questService } from '../../services/quest-engine/quest.service';
import { authenticateShop, requireActiveShop } from '../../middleware/auth.middleware';
import { logger } from '../../utils/logger';
import { z } from 'zod';
import { QuestConditionType, QuestRewardType } from '@prisma/client';

const router = Router();

// Apply shop authentication to all quest routes
router.use(authenticateShop, requireActiveShop);

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createQuestSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  startDate: z.string().datetime().optional().transform(d => d ? new Date(d) : undefined),
  endDate: z.string().datetime().optional().transform(d => d ? new Date(d) : undefined),
  conditions: z.array(
    z.object({
      type: z.nativeEnum(QuestConditionType),
      config: z.record(z.any()),
    })
  ).min(1),
  rewards: z.array(
    z.object({
      type: z.nativeEnum(QuestRewardType),
      config: z.record(z.any()),
    })
  ).min(1),
});

const updateQuestSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().datetime().optional().transform(d => d ? new Date(d) : undefined),
  endDate: z.string().datetime().optional().transform(d => d ? new Date(d) : undefined),
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/quests
 * List all quests for the shop
 */
router.get('/quests', async (req: Request, res: Response): Promise<any> => {
  try {
    const shopId = req.shop!.id;
    const activeOnly = req.query.active === 'true';

    const quests = activeOnly
      ? await questService.getActiveQuestsByShop(shopId)
      : await questService.getAllQuestsByShop(shopId);

    res.json({
      quests,
      total: quests.length,
    });
  } catch (error) {
    logger.error('Failed to list quests', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      error: 'Failed to retrieve quests',
    });
  }
});

/**
 * GET /api/quests/:id
 * Get single quest by ID
 */
router.get('/quests/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const quest = await questService.getQuestById(id);

    if (!quest) {
      return res.status(404).json({
        error: 'Quest not found',
      });
    }

    // Verify quest belongs to this shop
    if (quest.shopId !== req.shop!.id) {
      return res.status(403).json({
        error: 'Forbidden',
      });
    }

    res.json({ quest });
  } catch (error) {
    logger.error('Failed to get quest', {
      questId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      error: 'Failed to retrieve quest',
    });
  }
});

/**
 * POST /api/quests
 * Create a new quest
 */
router.post('/quests', async (req: Request, res: Response): Promise<any> => {
  try {
    const validatedData = createQuestSchema.parse(req.body);

    const quest = await questService.createQuest({
      shopId: req.shop!.id,
      ...validatedData,
    } as any);

    return res.status(201).json({
      quest,
      message: 'Quest created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    logger.error('Failed to create quest', {
      shopId: req.shop!.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({
      error: 'Failed to create quest',
    });
  }
});

/**
 * PUT /api/quests/:id
 * Update an existing quest
 */
router.put('/quests/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    // Verify quest exists and belongs to shop
    const existing = await questService.getQuestById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Quest not found' });
    }
    if (existing.shopId !== req.shop!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const validatedData = updateQuestSchema.parse(req.body);
    const quest = await questService.updateQuest(id, validatedData);

    res.json({
      quest,
      message: 'Quest updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    logger.error('Failed to update quest', {
      questId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({
      error: 'Failed to update quest',
    });
  }
});

/**
 * DELETE /api/quests/:id
 * Delete (deactivate) a quest
 */
router.delete('/quests/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    // Verify quest exists and belongs to shop
    const existing = await questService.getQuestById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Quest not found' });
    }
    if (existing.shopId !== req.shop!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await questService.deleteQuest(id);

    res.json({
      message: 'Quest deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete quest', {
      questId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({
      error: 'Failed to delete quest',
    });
  }
});

/**
 * GET /api/quests/:id/progress
 * Get progress for all customers on a specific quest
 */
router.get('/quests/:id/progress', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    // Verify quest exists and belongs to shop
    const quest = await questService.getQuestById(id);
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }
    if (quest.shopId !== req.shop!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get all progress for this quest
    const progress = await prisma.customerQuestProgress.findMany({
      where: {
        questId: id,
        shopId: req.shop!.id,
      },
      orderBy: {
        lastUpdatedAt: 'desc',
      },
    });

    res.json({
      questId: id,
      progress,
      total: progress.length,
    });
  } catch (error) {
    logger.error('Failed to get quest progress', {
      questId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({
      error: 'Failed to retrieve quest progress',
    });
  }
});

// Need to import prisma for the last route
import { prisma } from '../../utils/prisma';

export default router;
