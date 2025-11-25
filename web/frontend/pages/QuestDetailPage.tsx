import { Page, Layout, Card, Text, Badge, Button } from '@shopify/polaris';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface Quest {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  conditions: any[];
  rewards: any[];
}

export default function QuestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuest();
  }, [id]);

  const fetchQuest = async () => {
    try {
      const shop = new URLSearchParams(window.location.search).get('shop');
      const response = await fetch(`/api/quests/${id}?shop=${shop}`);
      const data = await response.json();
      setQuest(data.quest);
    } catch (error) {
      console.error('Failed to fetch quest:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Page title="Loading..." />;
  }

  if (!quest) {
    return <Page title="Quest not found" />;
  }

  return (
    <Page
      title={quest.name}
      backAction={{ onAction: () => navigate('/quests') }}
      secondaryActions={[
        {
          content: 'Edit',
          onAction: () => alert('Edit functionality coming soon'),
        },
        {
          content: 'Delete',
          destructive: true,
          onAction: () => alert('Delete functionality coming soon'),
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: '16px' }}>
              <Text variant="headingMd" as="h2">
                Quest Details
              </Text>
              <div style={{ marginTop: '16px' }}>
                <p>
                  <strong>Status:</strong>{' '}
                  <Badge status={quest.isActive ? 'success' : 'default'}>
                    {quest.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </p>
                <p style={{ marginTop: '8px' }}>
                  <strong>Description:</strong> {quest.description || 'No description'}
                </p>
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card title="Conditions">
            <div style={{ padding: '16px' }}>
              {quest.conditions.map((condition, index) => (
                <div key={index}>
                  <p>
                    <strong>Type:</strong> {condition.type}
                  </p>
                  <p>
                    <strong>Target:</strong>{' '}
                    {(condition.config as any).targetOrderCount || 'N/A'} orders
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card title="Rewards">
            <div style={{ padding: '16px' }}>
              {quest.rewards.map((reward, index) => (
                <div key={index}>
                  <p>
                    <strong>Type:</strong> {reward.type}
                  </p>
                  <p>
                    <strong>Discount:</strong> {(reward.config as any).percentage || 'N/A'}%
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
