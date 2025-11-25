import { useState, useEffect } from 'react';
import {
  Page,
  Layout,
  Card,
  Text,
  DataTable,
  Badge,
  Spinner,
  Banner,
  ProgressBar,
} from '@shopify/polaris';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface OverallMetrics {
  totalQuests: number;
  activeQuests: number;
  totalParticipants: number;
  totalCompletions: number;
  totalRewardsIssued: number;
  totalRewardsRedeemed: number;
  overallCompletionRate: number;
  overallRedemptionRate: number;
}

interface QuestAnalytics {
  questId: string;
  questName: string;
  isActive: boolean;
  totalParticipants: number;
  completedCount: number;
  inProgressCount: number;
  completionRate: number;
  averageProgress: number;
  rewardIssuedCount: number;
  rewardRedeemedCount: number;
  redemptionRate: number;
}

interface CustomerEngagement {
  totalCustomers: number;
  activeCustomers: number;
  completedAtLeastOne: number;
  averageQuestsPerCustomer: number;
  topCustomers: Array<{
    shopifyCustomerId: string;
    completedQuests: number;
    rewardsEarned: number;
  }>;
}

interface RevenueImpact {
  totalRewardsIssued: number;
  totalRewardsRedeemed: number;
  estimatedDiscountValue: number;
  redemptionsByType: Record<string, number>;
}

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shop = searchParams.get('shop');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overallMetrics, setOverallMetrics] = useState<OverallMetrics | null>(null);
  const [questAnalytics, setQuestAnalytics] = useState<QuestAnalytics[]>([]);
  const [customerEngagement, setCustomerEngagement] = useState<CustomerEngagement | null>(null);
  const [revenueImpact, setRevenueImpact] = useState<RevenueImpact | null>(null);

  useEffect(() => {
    if (!shop) {
      setError('Shop parameter is missing');
      setLoading(false);
      return;
    }

    fetchAnalytics();
  }, [shop]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, questsRes, customersRes, revenueRes] = await Promise.all([
        fetch(`/api/analytics/overview?shop=${shop}`),
        fetch(`/api/analytics/quests?shop=${shop}`),
        fetch(`/api/analytics/customers?shop=${shop}`),
        fetch(`/api/analytics/revenue?shop=${shop}`),
      ]);

      if (!overviewRes.ok || !questsRes.ok || !customersRes.ok || !revenueRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [overviewData, questsData, customersData, revenueData] = await Promise.all([
        overviewRes.json(),
        questsRes.json(),
        customersRes.json(),
        revenueRes.json(),
      ]);

      setOverallMetrics(overviewData.metrics);
      setQuestAnalytics(questsData.analytics);
      setCustomerEngagement(customersData.engagement);
      setRevenueImpact(revenueData.revenue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Page title="Analytics" backAction={{ onAction: () => navigate(`/quests?shop=${shop}`) }}>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spinner accessibilityLabel="Loading analytics" size="large" />
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Analytics" backAction={{ onAction: () => navigate(`/quests?shop=${shop}`) }}>
        <Layout>
          <Layout.Section>
            <Banner title="Error loading analytics" status="critical">
              <p>{error}</p>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  // Quest analytics table rows
  const questRows = questAnalytics.map((quest) => [
    quest.questName,
    <Badge status={quest.isActive ? 'success' : 'default'}>
      {quest.isActive ? 'Active' : 'Inactive'}
    </Badge>,
    quest.totalParticipants,
    quest.completedCount,
    `${quest.completionRate.toFixed(1)}%`,
    <div style={{ width: '100px' }}>
      <ProgressBar progress={quest.averageProgress} size="small" />
      <Text variant="bodySm" as="span">
        {quest.averageProgress.toFixed(1)}%
      </Text>
    </div>,
    quest.rewardIssuedCount,
    quest.rewardRedeemedCount,
    `${quest.redemptionRate.toFixed(1)}%`,
  ]);

  // Top customers table rows
  const customerRows = customerEngagement?.topCustomers.map((customer) => [
    customer.shopifyCustomerId,
    customer.completedQuests,
    customer.rewardsEarned,
  ]) || [];

  // Revenue by type rows
  const revenueTypeRows = revenueImpact
    ? Object.entries(revenueImpact.redemptionsByType).map(([type, count]) => [
        type.replace('_', ' '),
        count,
      ])
    : [];

  return (
    <Page
      title="Analytics Dashboard"
      backAction={{ onAction: () => navigate(`/quests?shop=${shop}`) }}
    >
      <Layout>
        {/* Overall Metrics */}
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Overall Performance
            </Text>
            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div>
                <Text variant="headingSm" as="h3" tone="subdued">
                  Total Quests
                </Text>
                <Text variant="heading2xl" as="p">
                  {overallMetrics?.totalQuests || 0}
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  {overallMetrics?.activeQuests || 0} active
                </Text>
              </div>
              <div>
                <Text variant="headingSm" as="h3" tone="subdued">
                  Total Participants
                </Text>
                <Text variant="heading2xl" as="p">
                  {overallMetrics?.totalParticipants || 0}
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  {overallMetrics?.totalCompletions || 0} completed
                </Text>
              </div>
              <div>
                <Text variant="headingSm" as="h3" tone="subdued">
                  Completion Rate
                </Text>
                <Text variant="heading2xl" as="p">
                  {overallMetrics?.overallCompletionRate.toFixed(1) || 0}%
                </Text>
                <div style={{ marginTop: '8px' }}>
                  <ProgressBar progress={overallMetrics?.overallCompletionRate || 0} size="small" />
                </div>
              </div>
              <div>
                <Text variant="headingSm" as="h3" tone="subdued">
                  Redemption Rate
                </Text>
                <Text variant="heading2xl" as="p">
                  {overallMetrics?.overallRedemptionRate.toFixed(1) || 0}%
                </Text>
                <div style={{ marginTop: '8px' }}>
                  <ProgressBar progress={overallMetrics?.overallRedemptionRate || 0} size="small" />
                </div>
              </div>
            </div>
          </Card>
        </Layout.Section>

        {/* Quest Performance */}
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Quest Performance
            </Text>
            <div style={{ marginTop: '16px' }}>
              {questAnalytics.length > 0 ? (
                <DataTable
                  columnContentTypes={[
                    'text',
                    'text',
                    'numeric',
                    'numeric',
                    'text',
                    'text',
                    'numeric',
                    'numeric',
                    'text',
                  ]}
                  headings={[
                    'Quest Name',
                    'Status',
                    'Participants',
                    'Completed',
                    'Completion Rate',
                    'Avg Progress',
                    'Rewards Issued',
                    'Rewards Redeemed',
                    'Redemption Rate',
                  ]}
                  rows={questRows}
                />
              ) : (
                <Text variant="bodyMd" as="p" tone="subdued">
                  No quest data available yet.
                </Text>
              )}
            </div>
          </Card>
        </Layout.Section>

        {/* Customer Engagement & Revenue Impact */}
        <Layout.Section>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Customer Engagement */}
            <Card>
              <Text variant="headingMd" as="h2">
                Customer Engagement
              </Text>
              <div style={{ marginTop: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <Text variant="bodyMd" as="p">
                    <strong>Total Customers:</strong> {customerEngagement?.totalCustomers || 0}
                  </Text>
                  <Text variant="bodyMd" as="p">
                    <strong>Active Customers:</strong> {customerEngagement?.activeCustomers || 0}
                  </Text>
                  <Text variant="bodyMd" as="p">
                    <strong>Completed At Least One:</strong> {customerEngagement?.completedAtLeastOne || 0}
                  </Text>
                  <Text variant="bodyMd" as="p">
                    <strong>Avg Quests per Customer:</strong>{' '}
                    {customerEngagement?.averageQuestsPerCustomer.toFixed(2) || 0}
                  </Text>
                </div>
                {customerRows.length > 0 && (
                  <>
                    <Text variant="headingSm" as="h3">
                      Top Performers
                    </Text>
                    <div style={{ marginTop: '8px' }}>
                      <DataTable
                        columnContentTypes={['text', 'numeric', 'numeric']}
                        headings={['Customer ID', 'Completed', 'Rewards']}
                        rows={customerRows}
                      />
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Revenue Impact */}
            <Card>
              <Text variant="headingMd" as="h2">
                Revenue Impact
              </Text>
              <div style={{ marginTop: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <Text variant="bodyMd" as="p">
                    <strong>Total Rewards Issued:</strong> {revenueImpact?.totalRewardsIssued || 0}
                  </Text>
                  <Text variant="bodyMd" as="p">
                    <strong>Total Rewards Redeemed:</strong> {revenueImpact?.totalRewardsRedeemed || 0}
                  </Text>
                  <Text variant="bodyMd" as="p">
                    <strong>Estimated Discount Value:</strong> ${revenueImpact?.estimatedDiscountValue.toFixed(2) || 0}
                  </Text>
                </div>
                {revenueTypeRows.length > 0 && (
                  <>
                    <Text variant="headingSm" as="h3">
                      Redemptions by Type
                    </Text>
                    <div style={{ marginTop: '8px' }}>
                      <DataTable
                        columnContentTypes={['text', 'numeric']}
                        headings={['Reward Type', 'Count']}
                        rows={revenueTypeRows}
                      />
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
