import { useEffect, useState } from 'react';
import jsonData from '@/data/data.json';

const useData = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setData(jsonData);
  };

  const updateData = (newData) => {
    setData(newData);
  };

  return { data, updateData, fetchData };
}

export default useData;
