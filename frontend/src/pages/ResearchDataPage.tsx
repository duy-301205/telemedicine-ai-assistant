import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { ResearchDataPlan } from '../types';
import { api } from '../api/client';
import { DataSplitTable } from '../components/DataSplitTable';

export const ResearchDataPage: React.FC = () => {
  const [dataPlan, setDataPlan] = useState<ResearchDataPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getDataPlan()
      .then((data) => {
        setDataPlan(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-16 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-sm text-slate-600">Đang tải kế hoạch dữ liệu nghiên cứu VinDr-CXR...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-800 max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
        <h4 className="font-bold">Không thể tải kế hoạch dữ liệu</h4>
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 py-2">
      <DataSplitTable dataPlan={dataPlan} />
    </div>
  );
};
