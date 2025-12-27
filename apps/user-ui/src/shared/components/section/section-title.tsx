import TitleBorder from '@src/assets/svg/title-border';

const SectionTitle = ({ title }: { title: string }) => {
  return (
    <div className="relative">
      <h1 className="md:text-3xl text-xl relative z-10 font-semibold">
        {title}
      </h1>
      <TitleBorder className="absolute top-[20%] size-[40px]" />
    </div>
  );
};
export default SectionTitle;
