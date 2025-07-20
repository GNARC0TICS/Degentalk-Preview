import React from 'react';
import { useDgtPackages } from './hooks/useDgtPackages.ts';

const DgtPackages: React.FC = () => {
  const { data, error, isLoading } = useDgtPackages();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No packages available.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">DGT Packages</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((pkg) => (
          <div key={pkg.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{pkg.name}</h2>
            <p>DGT: {pkg.dgtAmount.toLocaleString()}</p>
            <p>Price: ${pkg.price.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DgtPackages;
