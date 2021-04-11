import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { LandingPage } from '../components/Grants/LandingPage';

const IndexPage = () => {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      router.replace(window.location.pathname);
    }
  }, [router.pathname]);

  return (
    <LandingPage />
  );
};

export default IndexPage;
