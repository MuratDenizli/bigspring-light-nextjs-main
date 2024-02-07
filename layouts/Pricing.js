import Sample from "./components/Sample";

function Pricing({ data }) {
  const {
    frontmatter: { title, contents, call_to_action },
  } = data;
  return (
    <>
      <section className="pb-0">
        <div className="container">
          <h1 className="text-center font-normal">{title}</h1>
          <div className="section row -mt-10 justify-center md:mt-0">
            {contents.map((plan, index) => (
              <Sample cta={plan} />
            ))}
          </div>
        </div>
      </section>
      
    </>
  );
}

export default Pricing;
