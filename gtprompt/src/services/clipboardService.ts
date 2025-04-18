export const clipboardService = {
  /**
   * Write text to the clipboard
   * @param text The text to write to clipboard
   */
  async writeText(text: string): Promise<void> {
    try {
      // Por enquanto, usaremos a API do navegador
      // Posteriormente implementaremos com o plugin do Tauri
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to write to clipboard:', error);
      throw error;
    }
  },

  /**
   * Read text from clipboard
   * @returns The clipboard text content
   */
  async readText(): Promise<string> {
    try {
      // Por enquanto, usaremos a API do navegador
      // Posteriormente implementaremos com o plugin do Tauri
      return await navigator.clipboard.readText();
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      throw error;
    }
  }
}; 