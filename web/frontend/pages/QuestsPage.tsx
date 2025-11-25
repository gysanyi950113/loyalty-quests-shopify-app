import { Page, Layout, Card, Button, DataTable, Badge, EmptyState } from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface Quest {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  conditions: any[];
  rewards: any[];
}

export default function QuestsPage() {
  const navigate = useNavigate();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      const shop = new URLSearchParams(window.location.search).get('shop');
      const response = await fetch(`/api/quests?shop=${shop}`);
      const data = await response.json();
      setQuests(data.quests || []);
    } catch (error) {
      console.error('Failed to fetch quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const rows = quests.map((quest) => [
    quest.name,
    quest.description || '-',
    <Badge status={quest.isActive ? 'success' : 'default'}>
      {quest.isActive ? 'Active' : 'Inactive'}
    </Badge>,
    quest.conditions.length,
    quest.rewards.length,
    <Button onClick={() => navigate(`/quests/${quest.id}`)}>View</Button>,
  ]);

  return (
    <Page
      title="Quests"
      primaryAction={{
        content: 'Create Quest',
        onAction: () => navigate('/quests/new'),
      }}
      secondaryActions={[
        {
          content: 'View Analytics',
          onAction: () => navigate('/analytics'),
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          {quests.length === 0 && !loading ? (
            <Card>
              <EmptyState
                heading="Create your first quest"
                action={{
                  content: 'Create Quest',
                  onAction: () => navigate('/quests/new'),
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>
                  Quests motivate customers to complete actions like placing orders
                  and reward them with discounts.
                </p>
              </EmptyState>
            </Card>
          ) : (
            <Card>
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'numeric', 'numeric', 'text']}
                headings={[
                  'Name',
                  'Description',
                  'Status',
                  'Conditions',
                  'Rewards',
                  'Actions',
                ]}
                rows={rows}
              />
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
