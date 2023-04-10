import { Button, Input, Table } from "antd";
import { memo, useEffect, useState } from "react";
import { BiSearchAlt } from "react-icons/bi";
import { MdClear, MdOutlineCloudDownload } from "react-icons/md";
import { utils, writeFile } from "xlsx";
import { AxiosAuthInstance } from "./api";
import type { ColumnsType } from "antd/es/table";

interface PropsType {
  title?: string;
  loading?: boolean;
  columns: ColumnsType;
  data: any[];
  query: any;
  setQuery: any;
  total?: number;
  downloadOptions?: any;
  isPaginated?: boolean;
  isDownloadable?: boolean;
  isSearchable?: boolean;
  scroll?: any;
}

function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const DataTable = ({
  title = "List",
  loading = false,
  columns = [],
  data = [],
  query,
  setQuery,
  total = 10,
  downloadOptions,
  isPaginated = true,
  isDownloadable = true,
  isSearchable = true,
  scroll = { x: 1300 },
}: PropsType) => {
  const [search, setSearch] = useState("");
  const colObj = columns?.map((column: any) => ({
    ...column,
    key: column?.title,
  }));

  const handleDownload = async () => {
    AxiosAuthInstance.get(downloadOptions?.url ?? "/").then((res: any) => {
      const apiData = res?.data?.data[Object.keys(res?.data?.data)[0]]?.data;

      const sheetData = apiData?.length
        ? apiData?.map((data: any, idx: number) => {
            let obj: any = {
              "Serial No.": idx + 1,
            };
            let [key, value]: any = [];
            for ([key, value] of Object.entries(downloadOptions?.key)) {
              if (typeof value === "object") {
                obj[key] = value?.value(data[value?.field] ?? "");
                continue;
              }

              if (value?.includes(".")) {
                let nestedValue = data;
                value
                  ?.split(".")
                  ?.forEach(
                    (nestedKey: any) =>
                      (nestedValue = nestedValue[nestedKey] ?? "")
                  );
                obj[key] = nestedValue;
                continue;
              }

              obj[key] = data[value] ?? "";
            }
            return obj;
          })
        : Object.keys(downloadOptions?.key)?.map((key: string) => ({
            [key]: "",
          }));

      const ws = utils.json_to_sheet(sheetData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Data");
      writeFile(wb, title + ".xlsx");
    });
  };

  const debouncedValue = useDebounce(search, 500);
  useEffect(() => {
    setQuery({ ...query, searchTerm: debouncedValue });
  }, [debouncedValue]);

  return (
    <div>
      <Table
        loading={loading}
        columns={colObj}
        bordered
        scroll={scroll}
        dataSource={data}
        pagination={
          isPaginated && {
            responsive: true,
            showQuickJumper: true,
            showLessItems: true,
            defaultCurrent: query?.page ?? 1,
            defaultPageSize: query?.take ?? 10,
            showSizeChanger: true,
            onChange: (page: number, pageSize: number) =>
              setQuery({ ...query, page, take: pageSize }),
            total,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }
        }
        title={() =>
          (isDownloadable || isSearchable) && (
            <div
              style={{
                display: "flex",
                justifyContent: "end",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {isSearchable && (
                <Input
                  bordered={false}
                  allowClear={{
                    clearIcon: (
                      <MdClear
                        title="Clear"
                        style={{ fontSize: 20, margin: "auto" }}
                      />
                    ),
                  }}
                  suffix={
                    !search && (
                      <BiSearchAlt
                        title="Search"
                        style={{
                          fontSize: 20,
                        }}
                      />
                    )
                  }
                  style={{ borderBottom: "2px solid #ccc", width: 500 }}
                  prefix={
                    search && (
                      <BiSearchAlt
                        style={{
                          fontSize: 20,
                        }}
                      />
                    )
                  }
                  placeholder="Search ..."
                  value={search ?? ""}
                  onChange={(e: any) => setSearch(e?.target?.value)}
                />
              )}
              {isDownloadable && (
                <Button
                  title="Download"
                  icon={<MdOutlineCloudDownload style={{ fontSize: 20 }} />}
                  onClick={handleDownload}
                />
              )}
            </div>
          )
        }
      />
    </div>
  );
};

const areEqual = (prevProps: any, nextProps: any) =>
  JSON.stringify(prevProps) === JSON.stringify(nextProps);

export default memo(DataTable, areEqual);
