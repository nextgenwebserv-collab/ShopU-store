import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
interface HealthCategory {
  id: string;
  name: string;
  image: string;
}

interface Props {
  healthCategories: HealthCategory[];
}

const HealthCategoryGrid: React.FC<Props> = ({ healthCategories }) => {
  const router = useRouter();

  const handleclick = () => {
    router.push('/product?category=Health Condition');
  };
  return (
    <>
      {/* desktop view */}
      <section className="mx-auto hidden max-w-7xl sm:block">
        <div className="w-60">
          <h2 className="text-primaryColor text-xl font-semibold">
            Shop By <span className="text-secondaryColor">Health Condition</span>{' '}
          </h2>
          <hr className="bg-background1 mt-1 h-1 rounded border-0" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-8 pb-10 sm:grid-cols-4 sm:gap-4 md:grid-cols-4 lg:grid-cols-7">
          {healthCategories.map(category => (
            <div
              key={category.id}
              className="group cursor-pointer items-center rounded-lg"
              onClick={handleclick}
            >
              <div className="mb-1 flex justify-center transition-transform duration-300 group-hover:scale-102 sm:mb-2">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={100}
                  height={100}
                  className="h-32 w-36 rounded-lg object-cover"
                />
              </div>

              <h3 className="group-hover:text-primaryColor text-center text-sm font-medium text-black transition-colors sm:text-sm">
                {category.name}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile view */}
      <section className="mx-auto max-w-7xl sm:hidden">
        {/* Slider container */}
        <div className="no-scrollbar mt-6 overflow-x-auto sm:overflow-visible">
          <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {healthCategories.map(category => (
              <div
                key={category.id}
                onClick={handleclick}
                className="group min-w-[90px] flex-shrink-0 cursor-pointer items-center gap-2 rounded-lg"
              >
                <div className="mb-1 flex justify-center transition-transform duration-300 group-hover:scale-102">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={80}
                    height={80}
                    className="h-20 w-21 rounded-lg object-cover"
                  />
                </div>

                <h3 className="text-center text-xs font-medium text-black">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HealthCategoryGrid;
