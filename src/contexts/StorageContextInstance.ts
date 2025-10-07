/**
 * 存储上下文实例
 */

import { createContext } from 'react';
import { StorageContextType } from './StorageContext';

export const StorageContext = createContext<StorageContextType | undefined>(undefined);
