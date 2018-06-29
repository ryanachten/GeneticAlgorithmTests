import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import GeneticEvolutionPage from '../components/GeneticEvolutionPage';
import NeuralNetworkPage from '../components/NeuralNetworkPage';
import PerceptronPage from '../components/PerceptronPage';
import NeuroEvolutionPage from '../components/NeuroEvolutionPage';

const AppRouter = () => (
  <BrowserRouter>
    <div>
      <Switch>
        <Route path="/" component={GeneticEvolutionPage} exact={true} />
        <Route path="/neural" component={NeuralNetworkPage} exact={true} />
        <Route path="/perceptron" component={PerceptronPage} exact={true} />
        <Route path="/neuro" component={NeuroEvolutionPage} exact={true} />
        <Route component={GeneticEvolutionPage} />
      </Switch>
    </div>
  </BrowserRouter>
);

export default AppRouter;
