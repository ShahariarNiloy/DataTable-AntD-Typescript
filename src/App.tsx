import { useState } from 'react';
import './App.css';
import { DataTable } from './DataTable';
import { FetchData } from './api';

function App() {
  const [query, setQuery] = useState({
    searchTerm: '',
    page: 1,
    take: 10,
  });

  const userData = FetchData({
    url: '/user',
    key: 'User',
    optionalKey: query,
    searchQuery: query,
  });

  return (
    <div className="App">
      <DataTable
        title={'User List'}
        columns={[
          {
            title: 'Full Name',
            dataIndex: 'name',
          },
          {
            title: 'User Name',
            dataIndex: 'userName',
          },
          {
            title: 'Email',
            dataIndex: 'email',
          },
          {
            title: 'Role Name',
            dataIndex: 'role',
          },
          {
            title: 'Action',
            render: (_: any, record: any) => (
              <button key={record?.id}>View</button>
            ),
          },
        ]}
        loading={userData?.isLoading}
        data={
          userData?.data?.data?.users?.data?.length
            ? userData?.data?.data?.users?.data?.map((user: any) => ({
                key: user?.id,
                id: user.id,
                name: user?.full_name,
                email: user?.email,
                userName: user.user_name,
                role: user?.role?.role_name,
              }))
            : []
        }
        downloadOptions={{
          url: '/comparison-information-details-download',
          URL: 'https://bchapi.shebatech.com.bd:8090',
        }}
        query={query}
        setQuery={setQuery}
        total={userData?.data?.data?.users?.total}
        isDownloadable={false}
        isCustomDownload={true}
      />
    </div>
  );
}

export default App;
