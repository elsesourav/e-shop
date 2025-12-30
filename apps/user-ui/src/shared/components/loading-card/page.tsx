
const LoadingCard = (totalCard: number = 12) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
      {Array.from({ length: totalCard }).map((_, index) => (
        <div
          key={index}
          className="border border-gray-300 rounded-md p-4 m-2 animate-pulse bg-white"
        >
          <div className="bg-gray-200 h-48 w-full mb-4 rounded" />
          <div className="h-6 bg-gray-200 mb-2 rounded w-3/4" />
          <div className="h-4 bg-gray-200 mb-2 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}
export default LoadingCard