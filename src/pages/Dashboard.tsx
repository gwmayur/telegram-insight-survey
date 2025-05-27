
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { format } from 'date-fns';

interface SurveyResponse {
  id: string;
  name: string | null;
  age_group: string;
  usage_duration: string;
  usage_reason: string[];
  content_preference: string[];
  regular_bots_or_channels: string | null;
  recommend_telegram: string;
  improvement_suggestions: string | null;
  submitted_at: string;
}

const Dashboard = () => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const responsesPerPage = 10;

  useEffect(() => {
    fetchResponses();
  }, [currentPage]);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      
      // Get total count
      const { count } = await supabase
        .from('telegram_survey')
        .select('*', { count: 'exact', head: true });

      setTotalResponses(count || 0);

      // Get paginated responses
      const { data, error } = await supabase
        .from('telegram_survey')
        .select('*')
        .order('submitted_at', { ascending: false })
        .range((currentPage - 1) * responsesPerPage, currentPage * responsesPerPage - 1);

      if (error) throw error;
      
      setResponses(data || []);
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load survey responses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAgeGroupData = () => {
    const ageGroups = responses.reduce((acc, response) => {
      acc[response.age_group] = (acc[response.age_group] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(ageGroups).map(([name, value]) => ({ name, value }));
  };

  const getRecommendationData = () => {
    const recommendations = responses.reduce((acc, response) => {
      acc[response.recommend_telegram] = (acc[response.recommend_telegram] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(recommendations).map(([name, value]) => ({ name, value }));
  };

  const getUsageDurationData = () => {
    const durations = responses.reduce((acc, response) => {
      acc[response.usage_duration] = (acc[response.usage_duration] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(durations).map(([name, value]) => ({ name, value }));
  };

  const getContentPreferenceData = () => {
    const contentCounts = responses.reduce((acc, response) => {
      response.content_preference.forEach(content => {
        acc[content] = (acc[content] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(contentCounts)
      .map(([name, value]) => ({ name: name.replace(/^[^\s]+ /, ''), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'];

  const totalPages = Math.ceil(totalResponses / responsesPerPage);

  if (loading && responses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading survey data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Survey Dashboard</h1>
            <p className="text-gray-600 mt-2">Total Responses: {totalResponses}</p>
          </div>
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Take Survey
          </Button>
        </div>

        {responses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-2xl font-semibold text-gray-600 mb-4">No Survey Responses Yet</h2>
              <p className="text-gray-500 mb-6">Be the first to take the survey!</p>
              <Button onClick={() => navigate('/')}>Take Survey Now</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Age Groups Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Age Groups Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getAgeGroupData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getAgeGroupData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recommendation Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Would Recommend Telegram</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getRecommendationData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getRecommendationData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Usage Duration Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Telegram Usage Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getUsageDurationData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Content Preferences Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Content Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getContentPreferenceData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={10}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Survey Responses List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Survey Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {responses.map((response) => (
                    <div key={response.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <strong>Name:</strong> {response.name || 'Anonymous'}
                        </div>
                        <div>
                          <strong>Age Group:</strong> {response.age_group}
                        </div>
                        <div>
                          <strong>Usage Duration:</strong> {response.usage_duration}
                        </div>
                        <div>
                          <strong>Recommendation:</strong> {response.recommend_telegram}
                        </div>
                        <div>
                          <strong>Submitted:</strong> {format(new Date(response.submitted_at), 'MMM dd, yyyy HH:mm')}
                        </div>
                        <div>
                          <strong>Bots/Channels:</strong> {response.regular_bots_or_channels || 'None specified'}
                        </div>
                      </div>
                      {response.improvement_suggestions && (
                        <div className="mt-2">
                          <strong>Suggestions:</strong>
                          <p className="text-gray-700 mt-1">{response.improvement_suggestions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
