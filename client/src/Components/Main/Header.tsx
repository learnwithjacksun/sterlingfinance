const Header = () => {
  return (
    <>
      <header className="sticky top-0 z-50 bg-secondary">
        <nav className="h-[60px] flex items-center justify-center main">
          <a href="https://truemfb.com/" className="flex items-center gap-2">
            <img src="/logo.png" alt="logo" width={40} height={40} />
          </a>
        </nav>
      </header>
    </>
  );
};

export default Header;
