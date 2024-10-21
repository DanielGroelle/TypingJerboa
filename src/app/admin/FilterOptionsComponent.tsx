import { useEffect, useState } from "react";

export default function FilterOptionsComponent<T>({
  items,
  refFilteredItems,
  selectFilters,
  filters,
  deleteManyItems,
  setViewPage
}: {
  items: T[],
  refFilteredItems: {items: T[]}, //gets mutated and contains filtered items based on the filter
  selectFilters: {
    [filterName: string]: {
      getter: (item: T) => string,
      options: string[]
    }
  }
  filters: {[filterType: string]: {
    getter: (item: T) => (string | number | Date | null)
  }},
  deleteManyItems: ((items: T[]) => void) | null,
  setViewPage: (page: number) => void
}) {
  const [selectFiltersState, setSelectFiltersState] = useState(
    Object.fromEntries(
      Object.keys(selectFilters).map((key => [key, "any"]))
    )
  );
  const [sortDirection, setSortDirection] = useState("ascending");
  const [sortBy, setSortBy] = useState(Object.keys(filters)[0]);
  const [searchText, setSearchText] = useState("");
  const [exactSearch, setExactSearch] = useState(false);
  const [filterType, setFilterType] = useState("any");

  useEffect(() => {
    setViewPage(1);
  }, [selectFiltersState, sortDirection, sortBy, searchText, exactSearch, filterType]);

  refFilteredItems.items = items.filter((item)=>{
    //filter based on selectFilter
    for (const [key, selectFilter] of Object.entries(selectFilters)) {
      if (selectFilter.getter(item) !== selectFiltersState[key] && selectFiltersState[key] !== "any") {
        return false;
      }
    }
    
    //filter based on search
    if (searchText === "") {
      return true;
    }

    let filtered = false;
    if (filterType === "any") {
      for (const filter of Object.values(filters)) {
        const itemProperty = filter.getter(item)
        if (itemProperty === null) continue;

        filtered ||= itemProperty.toString() === searchText || (exactSearch ? false : itemProperty.toString().includes(searchText));
      }
    } else {
      const filter = filters[filterType];
      const itemProperty = filter.getter(item);
      if (itemProperty !== null) {
        filtered ||= itemProperty.toString() === searchText || (exactSearch ? false : itemProperty.toString().includes(searchText));
      }
    }
    return filtered;
  });

  //sort filtered items
  refFilteredItems.items.sort((itemA, itemB)=>{
    let valueA = filters[sortBy].getter(itemA);
    let valueB = filters[sortBy].getter(itemB);
    
    if (valueA === null) return -1;
    if (valueB === null) return 1;

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
    <div className="flex flex-row flex-wrap">
        <div>
          Sort:
          <select id="sort-select" onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
            setSortDirection(e.target.value);
          }}>
            <option>ascending</option>
            <option>descending</option>
          </select>
        </div>
        <div>
          by
          <select id="sort-by-select" onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
            setSortBy(e.target.value);
          }}>
            {
              Object.keys(filters).map(filter => <option key={filter} value={filter}>{filter}</option>)
            }
          </select>
        </div>
        {
          Object.entries(selectFilters).map(([key, selectFilter]) => (
            <div key={key}>
              Filter {key}:
              <select id="filter-select" onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
                setSelectFiltersState({...selectFiltersState, [key]: e.target.value});
              }}>
                <option value="any">any</option>
                {
                  selectFilter.options.map((option)=>{
                    return <option key={option} value={option}>{option}</option>
                  })
                }
              </select>
            </div>
          ))
        }
        <div>
          Search:
          <input id="item-search" type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
            setSearchText(e.target.value);
          }}/>
        </div>
        <div>
          in
          <select id="search-filter" onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
            setFilterType(e.target.value);
          }}>
            <option value="any">any</option>
            {
              Object.keys(filters).map(filter => <option key={filter} value={filter}>{filter}</option>)
            }
          </select>
        </div>
        
        <div className="w-fit">
          <input type="checkbox" id="exact-input" onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
            setExactSearch(e.target.checked);
          }}/>
          <label className="ml-1" htmlFor="exact-input">Exact</label>
        </div>

        {
          //if deleteManyItems is null dont show the button
          deleteManyItems ?
          <input type="button" className="border-solid border-red-700 border rounded-lg p-2 ml-2" onClick={() => deleteManyItems(refFilteredItems.items)} value="Delete all filtered" />
          :
          ""
        }
      </div>
  );
}