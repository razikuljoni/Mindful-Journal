import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { Layout } from '@/components/layout';
import { Seo } from '@/components/seo';
import Dashboard from '@/pages/dashboard';
import Write from '@/pages/write';
import Entries from '@/pages/entries';
import EntryView from '@/pages/entry-view';
import Calendar from '@/pages/calendar';
import Insights from '@/pages/insights';
import Breathe from '@/pages/breathe';
import Mindful from '@/pages/mindful';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/write" component={Write} />
        <Route path="/entries" component={Entries} />
        <Route path="/entries/:id" component={EntryView} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/insights" component={Insights} />
        <Route path="/breathe" component={Breathe} />
        <Route path="/mindful" component={Mindful} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Seo />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
