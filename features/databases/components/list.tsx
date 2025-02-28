"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useDatabases } from "@/hooks/useDatabases";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DatabaseListingPage = {};

export default function DatabaseListingPage({}: DatabaseListingPage) {
  const { data } = useDatabases();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selected, setSelected] = useState<string>();

  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="bg-primary text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold"> Application</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6 flex-grow">
        <h2 className="text-2xl font-bold mb-2">Project List</h2>
        <p className="mb-4 text-gray-700 ">
          This is the list of projects currently being managed. You can view
          their details below.
        </p>
        <Button
          size={"lg"}
          className="mb-10"
          onClick={() => setIsModalOpen(true)}
        >
          Add New
        </Button>
        <Separator style={{ marginTop: "10px" }} />
        <div className="grid grid-cols-1 mt-4 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.length == 0 && <h1>Project Empty</h1>}
          {data?.map((project) => (
            <Card
              key={project.id}
              className="shadow-lg hover:shadow-xl transition-shadow duration-300 "
            >
              <CardHeader className="bg-primary">
                <h3 className="text-xl text-white  font-semibold">
                  {project.projectName}
                </h3>
              </CardHeader>
              <CardContent className="p-4">
                <p className="">
                  <strong>Nama Database:</strong> {project.name}
                </p>
                <p>
                  <strong>Jenis Database:</strong> {project.type}
                </p>
                <p>
                  <strong>Host:</strong>{" "}
                  {project.type == "mysql"
                    ? String(project.uri).split("@")[1]
                    : project.uri.split("//")[1]}
                </p>
              </CardContent>
              <CardFooter className="bg-gray-100">
                <Button
                  onClick={() => {
                    localStorage.setItem(
                      "database",
                      JSON.stringify({
                        databaseId: project.id,
                        name: project.name,
                        project:project.projectName,
                        type: project.type
                      })
                    );
        
                    router.push("/p/" + project.id);
                  }}
                  className=""
                >
                  Go to Project
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">New</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Project</DialogTitle>
              <DialogDescription>
                Make changes to your project here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <form className={cn("grid items-start gap-4")}>
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input type="text" id="name" defaultValue="sms" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Database" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Database</SelectLabel>
                      <SelectItem value="apple">Mysql</SelectItem>
                      <SelectItem value="banana">Mongo</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="uri">Url</Label>
                <Input
                  id="uri"
                  type="url"
                  defaultValue=""
                  placeholder="mysql://root:124@localhost"
                />
              </div>
              <Button type="submit">Save changes</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
