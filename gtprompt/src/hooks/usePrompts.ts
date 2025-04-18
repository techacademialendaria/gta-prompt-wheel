import { useState, useEffect } from 'react';

interface Prompt {
  id: string;
  content: string;
  categoryId: string;
  iconPath?: string;
  variables?: Record<string, string>;
}

interface Category {
  id: string;
  name: string;
  color: string;
  position: number;
}

// Mocked sample data - will be replaced with Tauri API calls to database
const sampleCategories: Category[] = [
  { id: '1', name: 'General', color: '#6366f1', position: 0 },
  { id: '2', name: 'Code', color: '#10b981', position: 1 },
  { id: '3', name: 'Writing', color: '#f59e0b', position: 2 },
];

const samplePrompts: Prompt[] = [
  { id: '1', content: 'Help me debug this code', categoryId: '2', iconPath: '🐛' },
  { id: '2', content: 'Explain this concept', categoryId: '1', iconPath: '🧠' },
  { id: '3', content: 'Optimize this function', categoryId: '2', iconPath: '⚡' },
  
  // Categoria Writing com exatamente 8 prompts completos
  { id: 'w1', content: 'Escreva um blog post', categoryId: '3', iconPath: '📝' },
  { id: 'w2', content: 'Sumarize este artigo', categoryId: '3', iconPath: '📋' },
  { id: 'w3', content: 'Traduza para espanhol', categoryId: '3', iconPath: '🌎' },
  { id: 'w4', content: 'Corrija a gramática', categoryId: '3', iconPath: '✏️' },
  { id: 'w5', content: 'Gere uma imagem', categoryId: '3', iconPath: '🖼️' },
  { id: 'w6', content: 'Explique esse código', categoryId: '3', iconPath: '💻' },
  { id: 'w7', content: 'Escreva um email', categoryId: '3', iconPath: '📨' },
  { id: 'w8', content: 'Crie um script', categoryId: '3', iconPath: '🔄' },
  
  // Outros prompts para demais categorias
  { id: '5', content: 'Generate test cases', categoryId: '2', iconPath: '🧪' },
  { id: '6', content: 'Summarize this text', categoryId: '1', iconPath: '📋' },
  { id: '7', content: 'Translate to Spanish', categoryId: '1', iconPath: '🌍' },
  { id: '8', content: 'Fix grammar errors', categoryId: '1', iconPath: '✏️' },
];

export const usePrompts = () => {
  const [categories, setCategories] = useState<Category[]>(sampleCategories);
  const [prompts, setPrompts] = useState<Prompt[]>(samplePrompts);
  const [currentCategoryId, setCurrentCategoryId] = useState<string>(categories[0]?.id || '');
  
  // Get prompts for current category
  const currentPrompts = prompts.filter(prompt => prompt.categoryId === currentCategoryId);
  
  // Function to add a new prompt
  const addPrompt = (prompt: Omit<Prompt, 'id'>) => {
    const newPrompt: Prompt = {
      ...prompt,
      id: crypto.randomUUID(),
    };
    setPrompts([...prompts, newPrompt]);
  };
  
  // Function to update a prompt
  const updatePrompt = (id: string, updatedPrompt: Partial<Prompt>) => {
    setPrompts(prompts.map(prompt => 
      prompt.id === id ? { ...prompt, ...updatedPrompt } : prompt
    ));
  };
  
  // Function to delete a prompt
  const deletePrompt = (id: string) => {
    setPrompts(prompts.filter(prompt => prompt.id !== id));
  };
  
  // Function to change category
  const changeCategory = (categoryId: string) => {
    setCurrentCategoryId(categoryId);
  };
  
  // Function to add a new category
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
    };
    setCategories([...categories, newCategory]);
  };
  
  // Function to use a prompt (will be enhanced in the future)
  const usePrompt = async (promptId: string): Promise<string> => {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return '';
    
    // Logic to handle variables will go here
    
    // For now, just increment usage stats (to be implemented with real database)
    
    return prompt.content;
  };
  
  // In the future, we'll load from the database on component mount
  useEffect(() => {
    // Load from database
  }, []);
  
  return {
    categories,
    prompts: currentPrompts,
    currentCategoryId,
    changeCategory,
    addPrompt,
    updatePrompt,
    deletePrompt,
    addCategory,
    usePrompt,
  };
}; 