import { useEffect, useState } from "react";

export default function FilterOptionsComponent<T>({
  items,
  refFilteredItems,
  selectFilter,
  filters,
  deleteManyItems,
  setViewPage
}: {
  items: T[],
  refFilteredItems: {items: T[]}, //gets mutated and contains filtered items based on the filter
  selectFilter: {
    getter: (item: T) => string,
    options: string[]
  }
  filters: {[filterType: string]: {
    getter: (item: T) => string | number
  }},
  deleteManyItems: (items: T[]) => void,
  setViewPage: (page: number) => void
}) {
  const [filter, setFilter] = useState("any")
  const [sortDirection, setSortDirection] = useState("ascending");
  const [sortBy, setSortBy] = useState(Object.keys(filters)[0]);
  const [searchText, setSearchText] = useState("");
  const [exactSearch, setExactSearch] = useState(false);
  const [filterType, setFilterType] = useState("any");

  useEffect(() => {
    setViewPage(1);
  }, [filter, sortDirection, sortBy, searchText, exactSearch, filterType]);

  refFilteredItems.items = items.filter((item)=>{
    //filter based on selectFilter
    if (selectFilter.getter(item) !== filter && filter !== "any") {
      return false;
    }
    
    //filter based on search
    if (searchText === "") {
      return true;
    }

    let filtered = false;
    if (filterType === "any") {
      for (const filter of Object.values(filters)) {
        filtered ||= filter.getter(item) === searchText || (exactSearch ? false : filter.getter(item).toString().includes(searchText));
      }
    } else {
      const filter = filters[filterType];
      const itemProperty = filter.getter(item);
      filtered ||= itemProperty === searchText || (exactSearch ? false : itemProperty.toString().includes(searchText));
    }
    return filtered;
  });

  //sort filtered items
  refFilteredItems.items.sort((itemA, itemB)=>{
    let valueA = filters[sortBy].getter(itemA);
    let valueB = filters[sortBy].getter(itemB);

    if (typeof valueA === "string" && typeof valueB === "string") {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }

    if (valueA > valueB) {
      return sortDirection === "ascending" ? 1 : -1;
    }
    else {
      return sortDirection === "ascending" ? -1 : 1;
    }
  });

  return (
    <div>
        Sort:
        <select id="sort-select" onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
          setSortDirection(e.target.value);
        }}>
          <option>ascending</option>
          <option>descending</option>
        </select>
        by
        <select id="sort-by-select" onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
          setSortBy(e.target.value);
        }}>
          {
            Object.keys(filters).map(filter => <option key={filter} value={filter}>{filter}</option>)
          }
        </select>

        Filter:
        <select id="filter-select" onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
          setFilter(e.target.value);
        }}>
          <option value="any">any</option>
          {
            selectFilter.options.map((option)=>{
              return <option key={option} value={option}>{option}</option>
            })
          }
        </select>

        Search:
        <input id="item-search" type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
          setSearchText(e.target.value);
        }}/>
        in
        <select id="search-filter" onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
          setFilterType(e.target.value);
        }}>
          <option value="any">any</option>
          {
            Object.keys(filters).map(filter => <option key={filter} value={filter}>{filter}</option>)
          }
        </select>

        <input type="checkbox" id="exact-input" onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
          setExactSearch(e.target.checked);
        }}/>
        <label className="ml-1" htmlFor="exact-input">Exact</label>

        <input type="button" className="border-solid border-red-700 border rounded-lg p-2 ml-2" onClick={() => deleteManyItems(refFilteredItems.items)} value="Delete all filtered" />
      </div>
  );
}