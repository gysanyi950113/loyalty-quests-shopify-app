import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Banner,
} from '@shopify/polaris';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateQuestPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetOrders, setTargetOrders] = useState('3');
  const [rewardPercentage, setRewardPercentage] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const shop = new URLSearchParams(window.location.search).get('shop');

      const response = await fetch(`/api/quests?shop=${shop}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          isActive: true,
          conditions: [
            {
              type: 'ORDER_COUNT',
              config: {
                targetOrderCount: parseInt(targetOrders),
              },
            },
          ],
          rewards: [
            {
              type: 'DISCOUNT_PERCENTAGE',
              config: {
                percentage: parseInt(rewardPercentage),
                expiryDays: 30,
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create quest');
      }

      navigate('/quests');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page
      title="Create Quest"
      backAction={{ onAction: () => navigate('/quests') }}
      primaryAction={{
        content: 'Create Quest',
        onAction: handleSubmit,
        loading,
        disabled: !name || !targetOrders || !rewardPercentage,
      }}
    >
      <Layout>
        {error && (
          <Layout.Section>
            <Banner status="critical" onDismiss={() => setError('')}>
              {error}
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <FormLayout>
              <TextField
                label="Quest Name"
                value={name}
                onChange={setName}
                placeholder="e.g., Complete 3 Orders"
                autoComplete="off"
                helpText="Give your quest a clear, motivating name"
              />

              <TextField
                label="Description"
                value={description}
                onChange={setDescription}
                placeholder="e.g., Place 3 orders and get 10% off!"
                autoComplete="off"
                multiline={3}
                helpText="Explain what customers need to do"
              />
            </FormLayout>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card title="Quest Condition">
            <FormLayout>
              <Select
                label="Condition Type"
                options={[{ label: 'Order Count', value: 'ORDER_COUNT' }]}
                value="ORDER_COUNT"
                onChange={() => {}}
                disabled
                helpText="More condition types coming soon"
              />

              <TextField
                label="Target Number of Orders"
                type="number"
                value={targetOrders}
                onChange={setTargetOrders}
                min="1"
                helpText="How many orders must the customer place?"
              />
            </FormLayout>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card title="Reward">
            <FormLayout>
              <Select
                label="Reward Type"
                options={[
                  { label: 'Percentage Discount', value: 'DISCOUNT_PERCENTAGE' },
                ]}
                value="DISCOUNT_PERCENTAGE"
                onChange={() => {}}
                disabled
                helpText="More reward types coming soon"
              />

              <TextField
                label="Discount Percentage"
                type="number"
                value={rewardPercentage}
                onChange={setRewardPercentage}
                suffix="%"
                min="1"
                max="100"
                helpText="What percentage off should customers receive?"
              />
            </FormLayout>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
