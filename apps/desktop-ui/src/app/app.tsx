import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import RecipeForm from './pages/RecipeForm';
import { Ingredients } from './pages/ingredients';
import Activation from './pages/Activation';

export default function App() {
  const [isActivated, setIsActivated] = useState<boolean | null>(null);

  useEffect(() => {
    window.electron?.checkLicense().then((result) => {
      setIsActivated(result.activated);
    }).catch(() => {
      setIsActivated(false);
    });
  }, []);

  if (isActivated === null) return null;

  if (!isActivated) {
    return <Activation onActivated={() => setIsActivated(true)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="recipe/new" element={<RecipeForm />} />
        <Route path="recipe/:id" element={<RecipeForm />} />
        <Route path="ingredients" element={<Ingredients />} />
      </Route>
    </Routes>
  );
}
