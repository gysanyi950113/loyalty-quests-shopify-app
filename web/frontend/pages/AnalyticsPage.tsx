import { Page, Layout, Card, Text } from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';

export default function AnalyticsPage() {
  const navigate = useNavigate();

  return (
    <Page
      title="Analytics"
      backAction={{ onAction: () => navigate('/quests') }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <Text variant="headingMd" as="h2">
                Analytics Dashboard
              </Text>
              <p style={{ marginTop: '16px', color: '#666' }}>
                Quest performance metrics and customer insights coming soon.
              </p>
              <p style={{ marginTop: '8px', color: '#666' }}>
                This will include:
              </p>
              <ul style={{ marginTop: '8px', textAlign: 'left', maxWidth: '400px', margin: '16px auto' }}>
                <li>Quest completion rates</li>
                <li>Customer participation metrics</li>
                <li>Revenue from rewards</li>
                <li>Active vs completed quests</li>
                <li>Reward redemption rates</li>
              </ul>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
