import { create } from 'zustand';
import { AuthResponse, BoardData, Project, Workspace } from '../types';

type State = {
  auth?: AuthResponse;
  workspace?: Workspace;
  projects: Project[];
  board?: BoardData;
  setAuth: (auth?: AuthResponse) => void;
  setWorkspace: (w: Workspace) => void;
  setProjects: (items: Project[]) => void;
  setBoard: (board: BoardData) => void;
};

export const useAppStore = create<State>((set) => ({
  projects: [],
  setAuth: (auth) => set({ auth }),
  setWorkspace: (workspace) => set({ workspace }),
  setProjects: (projects) => set({ projects }),
  setBoard: (board) => set({ board })
}));
