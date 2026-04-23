# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source

# Copy csproj and restore
COPY ["TaskManager.API/TaskManager.API.csproj", "TaskManager.API/"]
RUN dotnet restore "TaskManager.API/TaskManager.API.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/source/TaskManager.API"
RUN dotnet publish -c Release -o /app

# Run stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
COPY ["firebase-service-account.json", "."]

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "TaskManager.API.dll"]
