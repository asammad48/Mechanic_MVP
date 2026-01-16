import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const BranchContext = createContext(null);

export const BranchProvider = ({ children }) => {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);

  useEffect(() => {
    if (user?.isSuperAdmin) {
      const fetchBranches = async () => {
        try {
          const { data } = await api.get('/branches');
          setBranches(data);
          const storedBranch = localStorage.getItem('selectedBranch');
          if (storedBranch) {
            setSelectedBranch(JSON.parse(storedBranch));
          } else {
            setSelectedBranch(data[0]);
          }
        } catch (error) {
          console.error('Failed to fetch branches:', error);
        }
      };
      fetchBranches();
    } else {
      setSelectedBranch(user?.branch);
    }
  }, [user]);

  const selectBranch = (branch) => {
    setSelectedBranch(branch);
    localStorage.setItem('selectedBranch', JSON.stringify(branch));
  };

  return (
    <BranchContext.Provider value={{ branches, selectedBranch, selectBranch }}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  return useContext(BranchContext);
};
