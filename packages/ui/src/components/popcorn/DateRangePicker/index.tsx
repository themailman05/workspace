export const DateRangePicker = () => {
  return (
    <div className="grid justify-items-stretch px-8">
      <div className="md:flex md:items-center md:justify-between justify-self-end">
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
                className="w-56 focus:ring-indigo-500 focus:border-indigo-500 block pr-10 sm:text-sm border-gray-300 rounded-md"
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
                className="w-56 focus:ring-indigo-500 focus:border-indigo-500 block pr-10 sm:text-sm border-gray-300 rounded-md"
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
    </div>
  );
};
