import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import EvolutionPage from '../components/EvolutionPage';
import NeuralPage from '../components/NeuralPage';
import PerceptronPage from '../components/PerceptronPage';

const AppRouter = () => (
  <BrowserRouter>
    <div>
      <Switch>
        <Route path="/" component={EvolutionPage} exact={true} />
        <Route path="/neural" component={NeuralPage} exact={true} />
        <Route path="/perceptron" component={PerceptronPage} exact={true} />
        <Route component={EvolutionPage} />
      </Switch>
    </div>
  </BrowserRouter>
);

export default AppRouter;
