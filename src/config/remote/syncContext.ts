import React from "react";
import { Sync } from "./sync";

const SyncContext = React.createContext<Partial<Sync>>({});

export default SyncContext;
