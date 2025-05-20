
const Header = ({ title }: { title: string }) => {
  return (
    <header className="flex justify-between items-center px-6 py-3 border-b border-gray-800">
      <h1 className="text-xl font-medium">{title}</h1>
    </header>
  );
};

export default Header;
