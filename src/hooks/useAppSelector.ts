import { useSelector, type TypedUseSelectorHook } from "react-redux";
import type { RootState } from "../app/store";

export interface IState {
  auth?: {
    user?: {
      email?: string;
      fullName?: string;
      id?: string;
      id_no?: string;
      phoneNo?: string;
      role?: string;
      token?: string;
    };
  };
}

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
