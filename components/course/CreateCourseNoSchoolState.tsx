import React from 'react';

const CreateCourseNoSchoolState = () => {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            No School Selected
          </h2>
          <p className="text-muted-foreground">
            Please select a school from the header to create courses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateCourseNoSchoolState;
