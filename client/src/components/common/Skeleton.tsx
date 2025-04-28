import React from 'react';

interface SkeletonProps {
  height?: number | string;
  width?: number | string | 'full';
  className?: string;
  rounded?: boolean;
  circle?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  height = 20,
  width = '100%',
  className = '',
  rounded = true,
  circle = false,
}) => {
  const getWidth = () => {
    if (width === 'full') return '100%';
    return typeof width === 'number' ? `${width}px` : width;
  };

  const getHeight = () => {
    return typeof height === 'number' ? `${height}px` : height;
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${
        rounded ? 'rounded-md' : ''
      } ${circle ? 'rounded-full' : ''} ${className}`}
      style={{
        width: getWidth(),
        height: getHeight(),
      }}
    />
  );
};

export default Skeleton;
