import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import IntakeForm from "@/pages/intake-form";
import TermsOfUse from "@/pages/terms-of-use";
import PrivacyNotice from "@/pages/privacy-notice";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={IntakeForm} />
      <Route path="/terms" component={TermsOfUse} />
      <Route path="/privacy" component={PrivacyNotice} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster />
    </>
  );
}

export default App;
