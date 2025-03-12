import React from 'react';
import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

interface FilterPanelProps {
  dateRange: string;
  projects: string[];
  teams: string[];
  plotCategories: string[];
  onDateRangeChange: (value: string) => void;
  onProjectsChange: (value: string[]) => void;
  onTeamsChange: (value: string[]) => void;
  onPlotCategoriesChange: (value: string[]) => void;
}

const dateRanges = [
  { id: 'all', name: 'All Time' },
  { id: 'today', name: 'Today' },
  { id: 'week', name: 'This Week' },
  { id: 'month', name: 'This Month' },
  { id: 'year', name: 'This Year' },
];

const FilterPanel: React.FC<FilterPanelProps> = ({
  dateRange,
  projects,
  teams,
  plotCategories,
  onDateRangeChange,
  onProjectsChange,
  onTeamsChange,
  onPlotCategoriesChange,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date Range
        </label>
        <Listbox value={dateRange} onChange={onDateRangeChange}>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <span className="block truncate text-gray-900 dark:text-white">
                {dateRanges.find((range) => range.id === dateRange)?.name}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {dateRanges.map((range) => (
                <Listbox.Option
                  key={range.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
                        : 'text-gray-900 dark:text-white'
                    }`
                  }
                  value={range.id}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {range.name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Projects/Blocks
        </label>
        <div className="space-y-2">
          {projects.map((project) => (
            <label key={project} className="flex items-center">
              <input
                type="checkbox"
                checked={projects.includes(project)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onProjectsChange([...projects, project]);
                  } else {
                    onProjectsChange(projects.filter((p) => p !== project));
                  }
                }}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-900 dark:text-white">
                {project}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Teams
        </label>
        <div className="space-y-2">
          {teams.map((team) => (
            <label key={team} className="flex items-center">
              <input
                type="checkbox"
                checked={teams.includes(team)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onTeamsChange([...teams, team]);
                  } else {
                    onTeamsChange(teams.filter((t) => t !== team));
                  }
                }}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-900 dark:text-white">
                {team}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Plot Categories
        </label>
        <div className="space-y-2">
          {plotCategories.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                checked={plotCategories.includes(category)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onPlotCategoriesChange([...plotCategories, category]);
                  } else {
                    onPlotCategoriesChange(plotCategories.filter((c) => c !== category));
                  }
                }}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-900 dark:text-white">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel; 