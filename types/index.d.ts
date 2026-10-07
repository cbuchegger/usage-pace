export type Reading = { percentUsed: number; resetsAt: string }

declare module 'claude-code' {
  interface PluginState {
    'pace': { session: Reading | null; weekly: Reading | null }
  }
}
