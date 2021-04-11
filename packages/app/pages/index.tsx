import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { LandingPage } from '../components/Grants/LandingPage';

const IndexPage = () => {
  const router = useRouter();


  return (
    <LandingPage />
  );
};

export default IndexPage;
