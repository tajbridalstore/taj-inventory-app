import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router";

const CardField = ({ data, title, className, link}) => {
  const navigate = useNavigate();
  return (
    <div>
      <Card className={className} onClick={()  => navigate(link)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardField;
