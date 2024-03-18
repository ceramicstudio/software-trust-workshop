import {create} from 'zustand';

type Store = {
  endpoint: string;
  setEndpoint: (newEndpoint: string) => void;
};

const useStore = create<Store>((set) => ({
  endpoint: "http://localhost:7007",
  setEndpoint: (newEndpoint) => set((state) => ({ endpoint: newEndpoint })),
}));

export default useStore;