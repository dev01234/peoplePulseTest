"use client";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface Props {
  onSearch: (value: string) => void;
}

const AdminSearchUserInput: React.FC<Props> = ({ onSearch }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="w-96 flex flex-col justify-center items-center mb-2 gap-y-2">
      <form className="relative w-11/12" onSubmit={handleSubmit}>
        <Input
          placeholder="Search here..."
          className="rounded-full pr-10"
          onChange={handleInputChange}
        />
        <Button
          type="submit"
          className="absolute right-1 top-1 rounded-full h-6 w-6"
          size="icon"
          variant="ghost"
        >
          <Search size={16} />
        </Button>
      </form>
    </div>
  );
};

export default AdminSearchUserInput;