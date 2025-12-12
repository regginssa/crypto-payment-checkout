interface ContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <main className="w-full min-h-screen flex flex-col lg:flex-row">
      <section className="hidden lg:flex lg:w-1/2 h-screen sticky top-0">
        <img
          src="/hero.png"
          alt="hero"
          className="w-full h-full object-cover"
        />
      </section>
      <section className="w-full lg:w-1/2 min-h-screen p-4 lg:p-8 flex flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
        {children}
      </section>
    </main>
  );
};

export default Container;
