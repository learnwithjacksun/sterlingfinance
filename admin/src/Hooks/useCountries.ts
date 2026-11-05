import { useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export interface Country {
    name: {
        common: string;
    };
    flags: {
        svg: string;
    };
}

const useCountries = () => {
    const [countries, setCountries] = useState<Country[]>([]);

    const fetchCountries = async () => {
        try {
          const response = await axios.get("https://restcountries.com/v3.1/all?fields=name,flags");
       
        return response.data;
        } catch (error) {
          console.error("Error fetching countries:", error);
        }
      };

      const {data, isLoading, error} = useQuery({
        queryKey: ["countries"],
        queryFn: fetchCountries

      })

      useEffect(() => {
        if (data) {
            // @ts-expect-error idk the type of the data
            setCountries(data.sort((a, b) => a.name.common.localeCompare(b.name.common)));
        }
      }, [data])

    return {
        countries,
        setCountries,
        isLoading,
        error
    }
}

export default useCountries;
