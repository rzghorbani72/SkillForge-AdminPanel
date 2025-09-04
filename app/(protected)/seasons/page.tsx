'use client';

import { useState } from 'react';
import { useSchool } from '@/contexts/SchoolContext';
import CreateSeasonDialog from '@/components/content/create-season-dialog';
import useSeasons from '@/components/season/useSeasons';
import Header from '@/components/season/Header';
import SearchBar from '@/components/season/SearchBar';
import StatsCard from '@/components/season/StatsCard';
import SeasonsGrid from '@/components/season/SeasonsGrid';

export default function SeasonsPage() {
  const { selectedSchool } = useSchool();
  const { seasons, courses, isLoading, searchTerm, setSearchTerm, refetch } =
    useSeasons();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredSeasons = seasons.filter(
    (season) =>
      season.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      season.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSeasonCreated = () => {
    setIsCreateDialogOpen(false);
    refetch();
  };

  if (!selectedSchool) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              No School Selected
            </h2>
            <p className="text-muted-foreground">
              Please select a school from the header to view seasons.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header onCreate={() => setIsCreateDialogOpen(true)} />

      <SearchBar value={searchTerm} onChange={setSearchTerm} />

      <StatsCard total={seasons.length} />

      <SeasonsGrid
        seasons={filteredSeasons}
        searchTerm={searchTerm}
        onCreate={() => setIsCreateDialogOpen(true)}
      />

      {/* Create Season Dialog */}
      {isCreateDialogOpen && (
        <CreateSeasonDialog
          onSeasonCreated={handleSeasonCreated}
          courses={courses}
          schoolId={selectedSchool.id}
        />
      )}
    </div>
  );
}
