import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import RecipeForm from './pages/RecipeForm';
import { Ingredients } from './pages/ingredients';

export default function App() {
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
