import { useEffect, useState } from 'react';
import jsonData from '@/data/data.json';

const useData = (slug=null) => {
  const [data, setData] = useState([]);
  const [detailData, setDetailData] = useState({});

  useEffect(() => {
    fetchData();
    if (slug) fetchDetailData();
  }, []);

  const fetchData = () => {
    setData(jsonData);
  };

  const fetchDetailData = () => {
    setDetailData(jsonData.find((item) => btoa(item.pdfUrl) === slug));
  }

  const updateData = (newData) => {
    setData(newData);
  };

  return { data, updateData, fetchData, detailData, fetchDetailData };
}

export default useData;
