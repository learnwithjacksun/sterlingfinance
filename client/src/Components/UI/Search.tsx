import { SearchIcon } from "lucide-react";

interface SearchProps {
  search: string;
  setSearch: (search: string) => void;
  placeholder?: string;
}

const Search = ({ search, setSearch, placeholder = "Search" }: SearchProps) => {
  return (
    <div className="flex items-center gap-2 border border-line rounded-md px-4 focus-within:border-primary">
      <SearchIcon size={20} />
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="text-sm w-full h-10"
      />
    </div>
  );
};

export default Search;
