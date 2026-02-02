import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  prepareExportData,
  formatCurrency,
  type RecipeDocument,
  type IngredientDocument,
} from "@costmate/core";

// Excel Export
export function exportToExcel(
  recipes: RecipeDocument[],
  ingredients: IngredientDocument[]
) {
  const data = prepareExportData(recipes, ingredients);
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ["Costmate Report"],
    ["Generated", data.generatedAt],
    [],
    ["Summary"],
    ["Total Recipes", data.summary.totalRecipes],
    ["Total Ingredients", data.summary.totalIngredients],
    ["Monthly Revenue", formatCurrency(data.summary.monthlyRevenue)],
    ["Monthly Profit", formatCurrency(data.summary.monthlyProfit)],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  // Recipes sheet
  const recipesData = [
    ["Name", "Cost", "Selling Price", "Profit", "Margin %", "Orders/Mo", "Ingredients", "Packaging"],
    ...data.recipes.map((r) => [
      r.name,
      r.cost,
      r.sellingPrice,
      r.profit,
      r.margin,
      r.ordersPerMonth,
      r.ingredientCount,
      r.packagingCount,
    ]),
  ];
  const recipesSheet = XLSX.utils.aoa_to_sheet(recipesData);
  XLSX.utils.book_append_sheet(wb, recipesSheet, "Recipes");

  // Ingredients sheet
  const ingredientsData = [
    ["Name", "Category", "Quantity", "Unit", "Price"],
    ...data.ingredients.map((i) => [i.name, i.category, i.quantity, i.unit, i.price]),
  ];
  const ingredientsSheet = XLSX.utils.aoa_to_sheet(ingredientsData);
  XLSX.utils.book_append_sheet(wb, ingredientsSheet, "Ingredients");

  // Download
  XLSX.writeFile(wb, `costmate-report-${Date.now()}.xlsx`);
}

// CSV Export
export function exportToCSV(
  recipes: RecipeDocument[],
  ingredients: IngredientDocument[]
) {
  const data = prepareExportData(recipes, ingredients);

  // Recipes CSV
  const recipesRows = [
    ["Name", "Cost", "Selling Price", "Profit", "Margin %", "Orders/Mo"],
    ...data.recipes.map((r) => [
      r.name,
      r.cost.toFixed(2),
      r.sellingPrice.toFixed(2),
      r.profit.toFixed(2),
      r.margin.toString(),
      r.ordersPerMonth,
    ]),
  ];
  const recipesCSV = recipesRows.map((row) => row.join(",")).join("\n");

  // Ingredients CSV
  const ingredientsRows = [
    ["Name", "Category", "Quantity", "Unit", "Price"],
    ...data.ingredients.map((i) => [i.name, i.category, i.quantity, i.unit, i.price]),
  ];
  const ingredientsCSV = ingredientsRows.map((row) => row.join(",")).join("\n");

  // Download both
  downloadFile(`costmate-recipes-${Date.now()}.csv`, recipesCSV);
  downloadFile(`costmate-ingredients-${Date.now()}.csv`, ingredientsCSV);
}

// PDF Export
export function exportToPDF(
  recipes: RecipeDocument[],
  ingredients: IngredientDocument[]
) {
  const data = prepareExportData(recipes, ingredients);
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text("Costmate Report", 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${data.generatedAt}`, 14, 28);

  // Summary
  doc.setFontSize(14);
  doc.text("Summary", 14, 40);
  doc.setFontSize(10);
  doc.text(`Total Recipes: ${data.summary.totalRecipes}`, 14, 48);
  doc.text(`Total Ingredients: ${data.summary.totalIngredients}`, 14, 54);
  doc.text(`Monthly Revenue: ${formatCurrency(data.summary.monthlyRevenue)}`, 14, 60);
  doc.text(`Monthly Profit: ${formatCurrency(data.summary.monthlyProfit)}`, 14, 66);

  // Recipes table
  doc.setFontSize(14);
  doc.text("Recipes", 14, 80);

  autoTable(doc, {
    startY: 85,
    head: [["Name", "Cost", "Price", "Profit", "Margin", "Orders/Mo"]],
    body: data.recipes.map((r) => [
      r.name,
      formatCurrency(r.cost),
      formatCurrency(r.sellingPrice),
      formatCurrency(r.profit),
      `${r.margin}%`,
      r.ordersPerMonth,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [50, 50, 50] },
  });

  // Ingredients table on new page
  doc.addPage();
  doc.setFontSize(14);
  doc.text("Ingredients", 14, 20);

  autoTable(doc, {
    startY: 25,
    head: [["Name", "Category", "Quantity", "Unit", "Price"]],
    body: data.ingredients.map((i) => [
      i.name,
      i.category,
      i.quantity,
      i.unit,
      `₱${i.price}`,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [50, 50, 50] },
  });

  // Download
  doc.save(`costmate-report-${Date.now()}.pdf`);
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
