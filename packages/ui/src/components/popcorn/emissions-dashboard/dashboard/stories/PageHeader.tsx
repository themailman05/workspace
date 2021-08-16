/* This example requires Tailwind CSS v2.0+ */
export default function Example() {
  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Smart Contract Carbon Emissions Dashboard
        </h2>
      </div>
      <div className="mt-4 flex md:mt-0 md:ml-4">
        <div className="mx-2">
          <label
            htmlFor="start"
            className="block text-sm font-medium text-gray-700"
          >
            Start
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="date"
              name="start"
              id="start"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="05/05/2021"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="end"
            className="block text-sm font-medium text-gray-700"
          >
            End
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="date"
              name="end"
              id="end"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="05/10/2021"
            />
          </div>
        </div>
        <button
          type="button"
          className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Update
        </button>
      </div>
    </div>
  );
}
