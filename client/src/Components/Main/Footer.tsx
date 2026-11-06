import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Quick Links",
    links: [
      {
        title: "Home",
        path: "/",
      },
      {
        title: "About",
        path: "/#about",
      },
      {
        title: "Projects",
        path: "/#projects",
      },
      {
        title: "Contact",
        path: "/contact",
      },
    ],
  },
  {
    title: "Legal",
    links: [
      {
        title: "Terms of Service",
        path: "/terms",
      },
      {
        title: "Privacy Policy",
        path: "/privacy",
      },
    ],
  },
  {
    title: "Company",
    links: [
      {
        title: "Copy Trading",
        path: "/",
      },
      {
        title: "Referral Program",
        path: "/",
      },
      {
        title: "Blog",
        path: "/",
      },
    ],
  },
];
const Footer = () => {
  return (
    <>
      <div
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://i.ibb.co/Pz5QPFM1/banner.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        className="mt-10 space-y-10 bg-secondary py-10 bg-attachment-fixed"
      >
        <div className="main text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-4">
              <Link to="/" className="flex flex-col gap-2">
                <div className="bg-white rounded-full h-12 w-12 flex items-center justify-center">
                  <img src="/logo.png" alt="logo" width={30} height={30} />
                </div>
                <h3 className="text-xl font-sora text-white font-bold">
                  Sterling Holdings
                </h3>
              </Link>

              <p className="text-white/80 text-sm">
                Making the world a better place through constructing elegant
                hierarchies. Innovations enabled by the TREASURY First Financial
                Bank Savings Bank results in products that assist workers.
              </p>
              <p className="text-white/80 text-sm">
                Head Office: Hainbuchen 99, Berg, Lower Austria
              </p>
              <p className="text-white/80 text-sm">Phone: +43 664 883 44 33</p>
              <p className="text-white/80 text-sm">
                Email: info@truemarkfinancialbank.com
              </p>
            </div>
            {footerLinks.map((link, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-lg font-sora font-bold">{link.title}</h3>
                <ul className="space-y-2">
                  {link.links.map((link, index) => (
                    <li key={index}>
                      <Link to={link.path} className="text-white/80 text-sm">
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-primary py-10">
        <p className="text-white text-sm main">
          &copy; {new Date().getFullYear()} Sterling Holdings. All rights
          reserved.
        </p>
      </div>
    </>
  );
};

export default Footer;
