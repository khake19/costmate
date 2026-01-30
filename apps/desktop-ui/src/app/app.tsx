import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import NewRecipe from './pages/NewRecipe';
import { Ingredients } from './pages/ingredients';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="recipe/new" element={<NewRecipe />} />
        <Route path="ingredients" element={<Ingredients />} />
      </Route>
    </Routes>
  );
}
