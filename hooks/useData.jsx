import { useEffect, useState } from 'react';
import fetchBooks from '../util/fetchBooks';

const useData = (slug = null) => {
  const [data, setData] = useState([]);
  const [detailData, setDetailData] = useState({});

  useEffect(() => {
    fetchData();
    if (slug) fetchDetailData(slug);
  }, [slug]);

  const fetchData = async () => {
    try {
      const booksData = await fetchBooks();
      setData(booksData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const fetchDetailData = async (slug) => {
    try {
      const booksData = await fetchBooks();
      const detail = booksData.find((item) => item.id === parseInt(slug));
      setDetailData(detail);
    } catch (error) {
      console.error('Failed to fetch detail data:', error);
    }
  };

  const updateData = (newData) => {
    setData(newData);
  };

  return { data, updateData, fetchData, detailData, fetchDetailData };
};

export default useData;
