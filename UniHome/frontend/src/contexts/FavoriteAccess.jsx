import { createContext, useContext } from "react";

export const FavoriteAccessContext = createContext({ signedIn: false, requestLogin: () => {} });
export const useFavoriteAccess = () => useContext(FavoriteAccessContext);
